import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createResource as createResourceRequest,
  deleteResource as deleteResourceRequest,
  getResources,
  getResourcesByTag,
  updateResource as updateResourceRequest,
} from '../api/methods/resource.methods';
import {
  createTag as createTagRequest,
  deleteTag as deleteTagRequest,
  getUserTags,
  type TagCreateRequest,
  type TagResponse,
} from '../api/methods/tag.methods';
import type {
  ResourceCreateRequest,
  ResourceListResponse,
  ResourceResponse,
  ResourceUpdate,
} from '../api/types/resource.types';
import toast from '../utils/toast';

interface PaginationState {
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface ResourceContextValue {
  tags: TagResponse[];
  resources: ResourceResponse[];
  pagination: PaginationState;
  selectedTag: string | null;
  currentPage: number;
  isLoadingTags: boolean;
  isLoadingResources: boolean;
  refreshTags: () => Promise<TagResponse[]>;
  refreshResources: (tag?: string | null, page?: number) => Promise<void>;
  fetchList: (tag?: string | null, page?: number) => Promise<void>;
  selectTag: (tag: string | null) => void;
  goToPage: (page: number) => void;
  createTag: (request: TagCreateRequest) => Promise<TagResponse>;
  deleteTag: (tagId: number, tagName: string) => Promise<void>;
  createBookmark: (request: ResourceCreateRequest) => Promise<ResourceResponse>;
  updateBookmark: (
    resourceId: number,
    resourceData: ResourceUpdate
  ) => Promise<ResourceResponse>;
  deleteBookmark: (resourceId: number) => Promise<void>;
}

const DEFAULT_PAGINATION: PaginationState = {
  total: 0,
  page: 1,
  size: 20,
  pages: 0,
};

const ResourceContext = createContext<ResourceContextValue | undefined>(undefined);

export const ResourceProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [resourcesResponse, setResourcesResponse] = useState<ResourceListResponse | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const tagsRequestIdRef = useRef(0);
  const resourcesRequestIdRef = useRef(0);

  const loadTags = useCallback(async () => {
    const requestId = ++tagsRequestIdRef.current;

    try {
      setIsLoadingTags(true);
      const nextTags = await getUserTags();
      const normalizedTags = Array.isArray(nextTags) ? nextTags : [];
      if (tagsRequestIdRef.current !== requestId) {
        return normalizedTags;
      }

      setTags(normalizedTags);
      return normalizedTags;
    } catch (error: any) {
      if (tagsRequestIdRef.current === requestId) {
        console.error('加载标签失败:', error);
        toast.error(error.message || '加载标签失败');
      }
      return [] as TagResponse[];
    } finally {
      if (tagsRequestIdRef.current === requestId) {
        setIsLoadingTags(false);
      }
    }
  }, []);

  const loadResources = useCallback(
    async (tag: string | null, page: number) => {
      const requestId = ++resourcesRequestIdRef.current;

      try {
        setIsLoadingResources(true);
        let targetPage = page;
        let nextResources = tag
          ? await getResourcesByTag(tag, targetPage, 20)
          : await getResources(targetPage, 20);

        if (resourcesRequestIdRef.current !== requestId) {
          return nextResources;
        }

        if (nextResources.pages > 0 && targetPage > nextResources.pages) {
          targetPage = nextResources.pages;
          nextResources = tag
            ? await getResourcesByTag(tag, targetPage, 20)
            : await getResources(targetPage, 20);

          if (resourcesRequestIdRef.current !== requestId) {
            return nextResources;
          }
        }

        setResourcesResponse(nextResources);
        setCurrentPage(targetPage);
        return nextResources;
      } catch (error: any) {
        if (resourcesRequestIdRef.current === requestId) {
          console.error('加载资源失败:', error);
          toast.error(error.message || '加载资源失败');
        }
        return null;
      } finally {
        if (resourcesRequestIdRef.current === requestId) {
          setIsLoadingResources(false);
        }
      }
    },
    []
  );

  const syncAfterMutation = useCallback(
    async (
      tag: string | null = selectedTag,
      page: number = currentPage,
      options: { refreshTags?: boolean } = {}
    ) => {
      const { refreshTags: shouldRefreshTags = true } = options;
      let nextTag = tag;
      let nextPage = page;

      if (shouldRefreshTags) {
        const nextTags = await loadTags();
        if (nextTag && !nextTags.some((item) => item.name === nextTag)) {
          nextTag = null;
          nextPage = 1;
        }
      }

      setSelectedTag(nextTag);
      setCurrentPage(nextPage);
      await loadResources(nextTag, nextPage);
    },
    [currentPage, loadResources, loadTags, selectedTag]
  );

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  useEffect(() => {
    void loadResources(selectedTag, currentPage);
  }, [currentPage, loadResources, selectedTag]);

  useEffect(() => {
    if (!selectedTag) {
      return;
    }

    const exists = tags.some((tag) => tag.name === selectedTag);
    if (!exists) {
      setSelectedTag(null);
      setCurrentPage(1);
    }
  }, [selectedTag, tags]);

  const pagination = resourcesResponse
    ? {
        total: resourcesResponse.total,
        page: resourcesResponse.page,
        size: resourcesResponse.size,
        pages: resourcesResponse.pages,
      }
    : DEFAULT_PAGINATION;

  const refreshTags = useCallback(async () => {
    return await loadTags();
  }, [loadTags]);

  const refreshResources = useCallback(
    async (tag: string | null = selectedTag, page: number = currentPage) => {
      await loadResources(tag, page);
    },
    [currentPage, loadResources, selectedTag]
  );

  const fetchList = useCallback(
    async (tag: string | null = selectedTag, page: number = currentPage) => {
      const nextTags = await loadTags();
      let nextTag = tag;
      let nextPage = page;

      if (nextTag && !nextTags.some((item) => item.name === nextTag)) {
        nextTag = null;
        nextPage = 1;
      }

      setSelectedTag(nextTag);
      setCurrentPage(nextPage);
      await loadResources(nextTag, nextPage);
    },
    [currentPage, loadResources, loadTags, selectedTag]
  );

  const selectTag = useCallback((tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > pagination.pages) {
        return;
      }

      setCurrentPage(page);
    },
    [pagination.pages]
  );

  const createTag = useCallback(
    async (request: TagCreateRequest) => {
      const createdTag = await createTagRequest(request);
      await loadTags();
      return createdTag;
    },
    [loadTags]
  );

  const deleteTag = useCallback(
    async (tagId: number, tagName: string) => {
      await deleteTagRequest(tagId);
      if (selectedTag === tagName) {
        await syncAfterMutation(null, 1);
      } else {
        await syncAfterMutation(selectedTag, currentPage);
      }
    },
    [currentPage, selectedTag, syncAfterMutation]
  );

  const createBookmark = useCallback(
    async (request: ResourceCreateRequest) => {
      const createdResource = await createResourceRequest(request);
      await syncAfterMutation(null, 1);
      return createdResource;
    },
    [syncAfterMutation]
  );

  const updateBookmark = useCallback(
    async (resourceId: number, resourceData: ResourceUpdate) => {
      const updatedResource = await updateResourceRequest(resourceId, resourceData);
      await syncAfterMutation(selectedTag, currentPage);
      return updatedResource;
    },
    [currentPage, selectedTag, syncAfterMutation]
  );

  const deleteBookmark = useCallback(
    async (resourceId: number) => {
      await deleteResourceRequest(resourceId);
      const shouldGoToPreviousPage =
        currentPage > 1 && (resourcesResponse?.resources.length ?? 0) <= 1;
      const nextPage = shouldGoToPreviousPage ? currentPage - 1 : currentPage;

      await syncAfterMutation(selectedTag, nextPage);
    },
    [currentPage, resourcesResponse?.resources.length, selectedTag, syncAfterMutation]
  );

  const value = useMemo<ResourceContextValue>(
    () => ({
      tags,
      resources: resourcesResponse?.resources ?? [],
      pagination,
      selectedTag,
      currentPage,
      isLoadingTags,
      isLoadingResources,
      refreshTags,
      refreshResources,
      fetchList,
      selectTag,
      goToPage,
      createTag,
      deleteTag,
      deleteBookmark,
      createBookmark,
      updateBookmark,
    }),
    [
      createBookmark,
      createTag,
      currentPage,
      deleteBookmark,
      deleteTag,
      fetchList,
      goToPage,
      isLoadingResources,
      isLoadingTags,
      pagination,
      refreshResources,
      refreshTags,
      resourcesResponse?.resources,
      selectedTag,
      selectTag,
      tags,
      updateBookmark,
    ]
  );

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
};

export const useResources = (): ResourceContextValue => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};
