export const supportedLocales = ["zh-CN", "en-US"] as const;

export type Locale = (typeof supportedLocales)[number];

type Messages = {
  common: {
    appName: string;
    cancel: string;
    save: string;
    loading: string;
  };
  layout: {
    about: string;
    home: string;
    chat: string;
    settings: string;
    iconAlt: string;
    previewReady: string;
  };
  home: {
    initializing: string;
    welcome: string;
    subtitle: string;
    bookmarkPlaceholder: string;
    bookmarkAction: string;
    tagSectionTitle: string;
    createTag: string;
    createShort: string;
    loadingTags: string;
    emptyTags: string;
    allResources: string;
    deleteTagTitle: string;
    resourceSectionTitle: string;
    totalResources: string;
    loadingResources: string;
    emptyResources: string;
    emptyResourcesInTag: string;
    deleteResource: string;
    editResource: string;
    invalidLink: string;
    invalidUrl: string;
    pageIndicator: string;
  };
  settings: {
    title: string;
    themeTitle: string;
    themeDescription: string;
    languageTitle: string;
    languageDescription: string;
    languageChinese: string;
    languageEnglish: string;
    aiTitle: string;
    aiDescription: string;
    updatedAt: string;
    loadingAI: string;
    modelName: string;
    hideApiKey: string;
    showApiKey: string;
    aiHint: string;
    testing: string;
    testConnection: string;
    saving: string;
    saveConfig: string;
    loadAIError: string;
    saveAIError: string;
    saveAISuccess: string;
    incompleteAIConfig: string;
    missingApiKey: string;
    testAIError: string;
  };
  about: {
    heroSubtitle: string;
    heroTypewriter: string;
    startExploring: string;
    coreFeatures: string;
    simpleSteps: string;
    finalTitle: string;
    finalDescription: string;
    finalAction: string;
    featureAiTitle: string;
    featureAiDescription: string;
    featureSearchTitle: string;
    featureSearchDescription: string;
    featureChatTitle: string;
    featureChatDescription: string;
    stepAddTitle: string;
    stepAddDescription: string;
    stepOrganizeTitle: string;
    stepOrganizeDescription: string;
    stepFindTitle: string;
    stepFindDescription: string;
  };
  chat: {
    title: string;
    subtitle: string;
    cancel: string;
    clearChat: string;
    emptyTitle: string;
    emptyDescription: string;
    thinking: string;
    userAvatar: string;
    inputPlaceholder: string;
    sending: string;
    send: string;
    enterHintDesktop: string;
    enterHintMobile: string;
    sendError: string;
    genericFailure: string;
  };
  auth: {
    loginTitle: string;
    registerTitle: string;
    loginSubtitle: string;
    registerSubtitle: string;
    usernameLabel: string;
    usernameLoginPlaceholder: string;
    usernameRegisterPlaceholder: string;
    passwordLabel: string;
    passwordLoginPlaceholder: string;
    passwordRegisterPlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    usernameEmpty: string;
    usernameLength: string;
    passwordEmpty: string;
    passwordLength: string;
    confirmPasswordEmpty: string;
    confirmPasswordMismatch: string;
    loginSuccess: string;
    registerSuccess: string;
    loginError: string;
    registerError: string;
    loggingIn: string;
    registering: string;
    noAccount: string;
    hasAccount: string;
    switchToRegister: string;
    switchToLogin: string;
  };
  bookmark: {
    urlEmpty: string;
    taskTitle: string;
    taskPreparing: string;
    taskQueued: string;
    taskQueuedDescription: string;
    taskSaving: string;
    taskCompleted: string;
    taskCompletedToast: string;
    taskFailed: string;
    taskFailedToast: string;
    titleEmpty: string;
    digestEmpty: string;
    tagRequired: string;
    saveSuccess: string;
    saveError: string;
    noteTitle: string;
    urlLabel: string;
    noteLabel: string;
    notePlaceholder: string;
    previewLoading: string;
    generatePreview: string;
    editTitle: string;
    titleLabel: string;
    digestLabel: string;
    tagsLabel: string;
    tagPlaceholder: string;
    addTag: string;
    back: string;
    saving: string;
    saveBookmark: string;
  };
  agentChat: {
    title: string;
    thinking: string;
    toolCompleted: string;
    inputPlaceholder: string;
    cancel: string;
    send: string;
    processing: string;
    sendError: string;
  };
  progress: {
    title: string;
    activeCompleted: string;
    clear: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    empty: string;
  };
  resourceCard: {
    clickToOpen: string;
  };
  tools: {
    completed: string;
    failed: string;
    input: string;
    output: string;
    error: string;
    result: string;
  };
  system: {
    bootstrapErrorTitle: string;
    bootstrapErrorDescription: string;
    startupTimeout: string;
    close: string;
  };
  modals: {
    createTagTitle: string;
    createTagLabel: string;
    createTagPlaceholder: string;
    createTagEmpty: string;
    createTagTooLong: string;
    createTagSuccess: string;
    createTagError: string;
    createTagLoading: string;
    createTagAction: string;
    deleteTagTitle: string;
    deleteTagPromptPrefix: string;
    deleteTagPromptSuffix: string;
    deleteTagWarning: string;
    deleteTagSuccess: string;
    deleteTagError: string;
    deleteLoading: string;
    confirmDelete: string;
    deleteResourceTitle: string;
    deleteResourcePromptPrefix: string;
    deleteResourcePromptSuffix: string;
    deleteResourceWarning: string;
    deleteResourceSuccess: string;
    deleteResourceError: string;
    editResourceTitle: string;
    resourceLink: string;
    resourceTitle: string;
    resourceDigest: string;
    resourceTags: string;
    resourceTitlePlaceholder: string;
    resourceDigestPlaceholder: string;
    resourceTagPlaceholder: string;
    addTag: string;
    editTitleEmpty: string;
    editSuccess: string;
    editError: string;
    savingChanges: string;
    saveChanges: string;
  };
};

export const messages: Record<Locale, Messages> = {
  "zh-CN": {
    common: {
      appName: "LinkBox",
      cancel: "取消",
      save: "保存",
      loading: "加载中",
    },
    layout: {
      about: "关于",
      home: "首页",
      chat: "AI对话",
      settings: "设置",
      iconAlt: "LinkBox 图标",
      previewReady: "点击完成预览，可以编辑收藏信息",
    },
    home: {
      initializing: "初始化中",
      welcome: "欢迎回来！收藏您喜欢的链接",
      subtitle: "欢迎回来！收藏您喜欢的链接",
      bookmarkPlaceholder: "输入要收藏的链接 (例如: https://github.com/example/repo)",
      bookmarkAction: "收藏",
      tagSectionTitle: "标签分类",
      createTag: "+ 新建标签",
      createShort: "+ 新建",
      loadingTags: "加载标签中",
      emptyTags: "暂无标签，收藏您的第一个链接吧！",
      allResources: "全部资源",
      deleteTagTitle: "删除标签 {name}",
      resourceSectionTitle: "#{tag} 资源",
      totalResources: "共 {count} 个资源",
      loadingResources: "加载资源中",
      emptyResources: "暂无收藏资源，先去收藏一些吧！",
      emptyResourcesInTag: "该标签下暂无资源",
      deleteResource: "🗑️ 删除",
      editResource: "✏️ 编辑",
      invalidLink: "请输入有效的链接",
      invalidUrl: "请输入有效的URL格式",
      pageIndicator: "{page} / {pages}",
    },
    settings: {
      title: "设置",
      themeTitle: "主题设置",
      themeDescription: "当前使用：新拟物风格主题",
      languageTitle: "语言设置",
      languageDescription: "选择界面显示语言，切换后立即生效。",
      languageChinese: "简体中文",
      languageEnglish: "English",
      aiTitle: "AI 配置",
      aiDescription: "在这里配置个人使用的 AI 服务，本地保存，保存后立即生效。",
      updatedAt: "更新于 {date}",
      loadingAI: "正在加载 AI 配置...",
      modelName: "模型名称",
      hideApiKey: "隐藏",
      showApiKey: "显示",
      aiHint: "这些配置会保存在本地数据库里，仅当前设备生效。开发环境下如果这里没填，会回退到 `.env` 中的默认值。",
      testing: "测试中...",
      testConnection: "测试连接",
      saving: "保存中...",
      saveConfig: "保存配置",
      loadAIError: "加载 AI 配置失败",
      saveAIError: "保存 AI 配置失败",
      saveAISuccess: "AI 配置已保存到本地",
      incompleteAIConfig: "请先填写完整的 AI 地址和模型名称",
      missingApiKey: "请先填写 AI API Key",
      testAIError: "测试 AI 配置失败",
    },
    about: {
      heroSubtitle: "智能收藏，AI 赋能的资源管理专家",
      heroTypewriter: "让您的收藏变得井井有条，智能分类，一键搜索",
      startExploring: "开始探索",
      coreFeatures: "核心功能",
      simpleSteps: "简单三步",
      finalTitle: "准备好管理您的收藏了吗？",
      finalDescription: "立即开始使用 LinkBox，让 AI 帮您整理数字资源",
      finalAction: "立即开始",
      featureAiTitle: "AI 智能分类",
      featureAiDescription: "自动为您的收藏生成标签和摘要，让资源管理更高效",
      featureSearchTitle: "强大搜索",
      featureSearchDescription: "通过标签、关键词快速找到您需要的资源",
      featureChatTitle: "AI 对话助手",
      featureChatDescription: "与 AI 对话，获取个性化的资源推荐和整理建议",
      stepAddTitle: "添加收藏",
      stepAddDescription: "粘贴链接或输入资源信息，AI 会自动识别并生成标签",
      stepOrganizeTitle: "智能整理",
      stepOrganizeDescription: "AI 自动分类，为每个资源生成摘要和标签",
      stepFindTitle: "快速查找",
      stepFindDescription: "通过标签筛选或关键词搜索，秒速定位您的收藏",
    },
    chat: {
      title: "LinkBot",
      subtitle: "您好，您想找什么？",
      cancel: "取消",
      clearChat: "清空对话",
      emptyTitle: "AI助手等待中",
      emptyDescription: "输入您的问题或想法，开始与AI对话",
      thinking: "AI正在思考中...",
      userAvatar: "我",
      inputPlaceholder: "输入您的问题或想法...",
      sending: "发送中",
      send: "发送",
      enterHintDesktop: "按 Enter 发送，Shift + Enter 换行",
      enterHintMobile: "点击发送按钮或按 Enter 发送",
      sendError: "Agent对话失败，请重试",
      genericFailure: "抱歉，我遇到了一些问题，请稍后重试。",
    },
    auth: {
      loginTitle: "登录",
      registerTitle: "注册",
      loginSubtitle: "欢迎回来！请输入您的账号信息",
      registerSubtitle: "创建新账号，开始使用LinkBox",
      usernameLabel: "用户名 *",
      usernameLoginPlaceholder: "请输入用户名",
      usernameRegisterPlaceholder: "3-50个字符",
      passwordLabel: "密码 *",
      passwordLoginPlaceholder: "请输入密码",
      passwordRegisterPlaceholder: "6-100个字符",
      confirmPasswordLabel: "确认密码 *",
      confirmPasswordPlaceholder: "请再次输入密码",
      usernameEmpty: "用户名不能为空",
      usernameLength: "用户名长度必须在3-50个字符之间",
      passwordEmpty: "密码不能为空",
      passwordLength: "密码长度必须在6-100个字符之间",
      confirmPasswordEmpty: "请确认密码",
      confirmPasswordMismatch: "两次输入的密码不一致",
      loginSuccess: "登录成功！",
      registerSuccess: "注册成功！",
      loginError: "登录失败，请重试",
      registerError: "注册失败，请重试",
      loggingIn: "登录中",
      registering: "注册中",
      noAccount: "还没有账号？",
      hasAccount: "已有账号？",
      switchToRegister: "立即注册 →",
      switchToLogin: "← 返回登录",
    },
    bookmark: {
      urlEmpty: "URL不能为空",
      taskTitle: "抓取并保存链接",
      taskPreparing: "准备开始抓取并入库...",
      taskQueued: "已加入后台任务，抓取完成后会自动入库",
      taskQueuedDescription: "正在保存到收藏夹...",
      taskSaving: "正在保存到收藏夹...",
      taskCompleted: "抓取完成，已自动保存到收藏夹",
      taskCompletedToast: "抓取完成，链接和标签已自动入库",
      taskFailed: "抓取或入库失败",
      taskFailedToast: "抓取或自动入库失败，请重试",
      titleEmpty: "标题不能为空",
      digestEmpty: "摘要不能为空",
      tagRequired: "至少需要一个标签",
      saveSuccess: "收藏成功！",
      saveError: "收藏失败，请重试",
      noteTitle: "收藏链接",
      urlLabel: "链接地址",
      noteLabel: "备注说明 (可选)",
      notePlaceholder: "为这个链接添加一些说明，帮助AI更好地生成标题和摘要...",
      previewLoading: "生成预览中",
      generatePreview: "生成预览",
      editTitle: "编辑收藏信息",
      titleLabel: "标题 *",
      digestLabel: "摘要 *",
      tagsLabel: "标签 *",
      tagPlaceholder: "输入标签名称",
      addTag: "添加",
      back: "返回",
      saving: "保存中",
      saveBookmark: "保存收藏",
    },
    agentChat: {
      title: "AI 智能助手",
      thinking: "AI正在思考...",
      toolCompleted: "调用完成",
      inputPlaceholder: "输入你的问题，例如：搜索React相关的资源...",
      cancel: "取消",
      send: "发送",
      processing: "AI正在处理中...",
      sendError: "发送消息失败",
    },
    progress: {
      title: "抓取进度",
      activeCompleted: "{active} 进行中, {completed} 已完成",
      clear: "清除",
      justNow: "刚刚",
      minutesAgo: "{count}分钟前",
      hoursAgo: "{count}小时前",
      daysAgo: "{count}天前",
      empty: "暂无任务",
    },
    resourceCard: {
      clickToOpen: "→ 点击打开",
    },
    tools: {
      completed: "已完成",
      failed: "出错",
      input: "输入参数:",
      output: "输出结果:",
      error: "错误信息:",
      result: "执行结果:",
    },
    system: {
      bootstrapErrorTitle: "LinkBox 启动失败",
      bootstrapErrorDescription: "桌面应用没有成功完成初始化。",
      startupTimeout: "桌面端后端服务启动超时",
      close: "关闭",
    },
    modals: {
      createTagTitle: "创建新标签",
      createTagLabel: "标签名称 *",
      createTagPlaceholder: "输入标签名称...",
      createTagEmpty: "标签名称不能为空",
      createTagTooLong: "标签名称不能超过50个字符",
      createTagSuccess: "标签创建成功！",
      createTagError: "创建标签失败，请重试",
      createTagLoading: "创建中",
      createTagAction: "创建标签",
      deleteTagTitle: "删除标签确认",
      deleteTagPromptPrefix: "您确定要删除标签",
      deleteTagPromptSuffix: "吗？",
      deleteTagWarning: "⚠️ 警告：删除标签后，该标签与所有资源的关联关系也将被删除，此操作不可恢复。",
      deleteTagSuccess: "标签删除成功！",
      deleteTagError: "删除标签失败，请重试",
      deleteLoading: "删除中",
      confirmDelete: "确认删除",
      deleteResourceTitle: "删除资源确认",
      deleteResourcePromptPrefix: "您确定要删除资源",
      deleteResourcePromptSuffix: "吗？",
      deleteResourceWarning: "⚠️ 删除后将从数据库中移除这条收藏，并同步更新相关标签分类，此操作不可恢复。",
      deleteResourceSuccess: "资源删除成功！",
      deleteResourceError: "删除资源失败，请重试",
      editResourceTitle: "编辑资源信息",
      resourceLink: "链接地址",
      resourceTitle: "标题 *",
      resourceDigest: "摘要",
      resourceTags: "标签",
      resourceTitlePlaceholder: "输入资源标题",
      resourceDigestPlaceholder: "输入资源摘要",
      resourceTagPlaceholder: "输入标签名称",
      addTag: "添加",
      editTitleEmpty: "标题不能为空",
      editSuccess: "资源更新成功！",
      editError: "更新资源失败，请重试",
      savingChanges: "保存中",
      saveChanges: "保存更改",
    },
  },
  "en-US": {
    common: {
      appName: "LinkBox",
      cancel: "Cancel",
      save: "Save",
      loading: "Loading",
    },
    layout: {
      about: "About",
      home: "Home",
      chat: "AI Chat",
      settings: "Settings",
      iconAlt: "LinkBox icon",
      previewReady: "Preview is ready. Click to edit the bookmark details.",
    },
    home: {
      initializing: "Initializing",
      welcome: "Welcome back! Save the links you love.",
      subtitle: "Welcome back! Save the links you love.",
      bookmarkPlaceholder: "Paste a link to save (for example: https://github.com/example/repo)",
      bookmarkAction: "Save",
      tagSectionTitle: "Tags",
      createTag: "+ New Tag",
      createShort: "+ New",
      loadingTags: "Loading tags",
      emptyTags: "No tags yet. Save your first link to get started.",
      allResources: "All Resources",
      deleteTagTitle: "Delete tag {name}",
      resourceSectionTitle: "#{tag} resources",
      totalResources: "{count} resources",
      loadingResources: "Loading resources",
      emptyResources: "No bookmarks yet. Save something first.",
      emptyResourcesInTag: "No resources found under this tag.",
      deleteResource: "🗑️ Delete",
      editResource: "✏️ Edit",
      invalidLink: "Please enter a valid link.",
      invalidUrl: "Please enter a valid URL.",
      pageIndicator: "{page} / {pages}",
    },
    settings: {
      title: "Settings",
      themeTitle: "Theme",
      themeDescription: "Current theme: Neo-brutalist notebook style.",
      languageTitle: "Language",
      languageDescription: "Choose the display language. Changes apply immediately.",
      languageChinese: "简体中文",
      languageEnglish: "English",
      aiTitle: "AI Configuration",
      aiDescription: "Configure the AI service you want to use. Changes are stored locally and take effect immediately.",
      updatedAt: "Updated {date}",
      loadingAI: "Loading AI configuration...",
      modelName: "Model Name",
      hideApiKey: "Hide",
      showApiKey: "Show",
      aiHint: "These settings are stored in the local database and only apply on this device. In development, empty values fall back to the defaults in `.env`.",
      testing: "Testing...",
      testConnection: "Test Connection",
      saving: "Saving...",
      saveConfig: "Save Configuration",
      loadAIError: "Failed to load AI configuration",
      saveAIError: "Failed to save AI configuration",
      saveAISuccess: "AI configuration saved locally",
      incompleteAIConfig: "Please fill in both the AI endpoint and model name.",
      missingApiKey: "Please enter an AI API key.",
      testAIError: "Failed to test AI configuration",
    },
    about: {
      heroSubtitle: "Smart bookmarking with an AI-powered resource manager.",
      heroTypewriter: "Keep every bookmark organized with intelligent tags and instant search.",
      startExploring: "Start Exploring",
      coreFeatures: "Core Features",
      simpleSteps: "Three Simple Steps",
      finalTitle: "Ready to organize your bookmarks?",
      finalDescription: "Start using LinkBox today and let AI tidy up your digital resources.",
      finalAction: "Get Started",
      featureAiTitle: "AI Categorization",
      featureAiDescription: "Automatically generate tags and summaries so your library stays tidy.",
      featureSearchTitle: "Powerful Search",
      featureSearchDescription: "Find what you need fast with tags and keyword search.",
      featureChatTitle: "AI Assistant",
      featureChatDescription: "Chat with AI for tailored recommendations and organization tips.",
      stepAddTitle: "Save a Link",
      stepAddDescription: "Paste a URL or resource info and AI will suggest tags automatically.",
      stepOrganizeTitle: "Organize Smartly",
      stepOrganizeDescription: "AI classifies each item and generates summaries and tags for you.",
      stepFindTitle: "Find It Fast",
      stepFindDescription: "Filter by tag or search by keyword to reach any bookmark in seconds.",
    },
    chat: {
      title: "LinkBot",
      subtitle: "What would you like to find today?",
      cancel: "Cancel",
      clearChat: "Clear Chat",
      emptyTitle: "AI assistant standing by",
      emptyDescription: "Ask a question or share an idea to start the conversation.",
      thinking: "AI is thinking...",
      userAvatar: "Me",
      inputPlaceholder: "Type your question or idea...",
      sending: "Sending",
      send: "Send",
      enterHintDesktop: "Press Enter to send, Shift + Enter for a new line",
      enterHintMobile: "Tap Send or press Enter to send",
      sendError: "Agent chat failed. Please try again.",
      genericFailure: "Sorry, I ran into a problem. Please try again in a moment.",
    },
    auth: {
      loginTitle: "Sign In",
      registerTitle: "Create Account",
      loginSubtitle: "Welcome back. Enter your account details to continue.",
      registerSubtitle: "Create a new account to start using LinkBox.",
      usernameLabel: "Username *",
      usernameLoginPlaceholder: "Enter your username",
      usernameRegisterPlaceholder: "3-50 characters",
      passwordLabel: "Password *",
      passwordLoginPlaceholder: "Enter your password",
      passwordRegisterPlaceholder: "6-100 characters",
      confirmPasswordLabel: "Confirm Password *",
      confirmPasswordPlaceholder: "Enter your password again",
      usernameEmpty: "Username cannot be empty.",
      usernameLength: "Username must be between 3 and 50 characters.",
      passwordEmpty: "Password cannot be empty.",
      passwordLength: "Password must be between 6 and 100 characters.",
      confirmPasswordEmpty: "Please confirm your password.",
      confirmPasswordMismatch: "The passwords do not match.",
      loginSuccess: "Signed in successfully.",
      registerSuccess: "Account created successfully.",
      loginError: "Failed to sign in. Please try again.",
      registerError: "Failed to create the account. Please try again.",
      loggingIn: "Signing in",
      registering: "Creating account",
      noAccount: "Don't have an account yet?",
      hasAccount: "Already have an account?",
      switchToRegister: "Create one now →",
      switchToLogin: "← Back to sign in",
    },
    bookmark: {
      urlEmpty: "URL cannot be empty.",
      taskTitle: "Fetch and save link",
      taskPreparing: "Preparing to fetch and save the bookmark...",
      taskQueued: "Added to the background queue. It will be saved automatically when ready.",
      taskQueuedDescription: "Saving to your library...",
      taskSaving: "Saving to your library...",
      taskCompleted: "Done fetching. The bookmark has been saved automatically.",
      taskCompletedToast: "Finished fetching. The link and tags were saved automatically.",
      taskFailed: "Fetching or saving failed",
      taskFailedToast: "Failed to fetch or save automatically. Please try again.",
      titleEmpty: "Title cannot be empty.",
      digestEmpty: "Summary cannot be empty.",
      tagRequired: "Please add at least one tag.",
      saveSuccess: "Bookmark saved successfully.",
      saveError: "Failed to save the bookmark. Please try again.",
      noteTitle: "Save Bookmark",
      urlLabel: "Link",
      noteLabel: "Notes (optional)",
      notePlaceholder: "Add context for this link so AI can generate a better title and summary...",
      previewLoading: "Generating preview",
      generatePreview: "Generate Preview",
      editTitle: "Edit Bookmark",
      titleLabel: "Title *",
      digestLabel: "Summary *",
      tagsLabel: "Tags *",
      tagPlaceholder: "Enter a tag name",
      addTag: "Add",
      back: "Back",
      saving: "Saving",
      saveBookmark: "Save Bookmark",
    },
    agentChat: {
      title: "AI Assistant",
      thinking: "AI is thinking...",
      toolCompleted: "completed",
      inputPlaceholder: "Ask a question, for example: find resources about React...",
      cancel: "Cancel",
      send: "Send",
      processing: "AI is processing...",
      sendError: "Failed to send the message",
    },
    progress: {
      title: "Fetch Progress",
      activeCompleted: "{active} active, {completed} completed",
      clear: "Clear",
      justNow: "just now",
      minutesAgo: "{count} min ago",
      hoursAgo: "{count} hr ago",
      daysAgo: "{count} day ago",
      empty: "No tasks yet",
    },
    resourceCard: {
      clickToOpen: "→ Click to open",
    },
    tools: {
      completed: "completed",
      failed: "failed",
      input: "Input:",
      output: "Output:",
      error: "Error:",
      result: "Result:",
    },
    system: {
      bootstrapErrorTitle: "LinkBox failed to start",
      bootstrapErrorDescription: "The desktop app did not finish initializing.",
      startupTimeout: "Timed out while waiting for the desktop backend to start",
      close: "Close",
    },
    modals: {
      createTagTitle: "Create New Tag",
      createTagLabel: "Tag Name *",
      createTagPlaceholder: "Enter a tag name...",
      createTagEmpty: "Tag name cannot be empty.",
      createTagTooLong: "Tag name cannot exceed 50 characters.",
      createTagSuccess: "Tag created successfully.",
      createTagError: "Failed to create the tag. Please try again.",
      createTagLoading: "Creating",
      createTagAction: "Create Tag",
      deleteTagTitle: "Delete Tag",
      deleteTagPromptPrefix: "Are you sure you want to delete tag",
      deleteTagPromptSuffix: "?",
      deleteTagWarning: "⚠️ Warning: deleting this tag will also remove its associations from all resources. This action cannot be undone.",
      deleteTagSuccess: "Tag deleted successfully.",
      deleteTagError: "Failed to delete the tag. Please try again.",
      deleteLoading: "Deleting",
      confirmDelete: "Confirm Delete",
      deleteResourceTitle: "Delete Resource",
      deleteResourcePromptPrefix: "Are you sure you want to delete resource",
      deleteResourcePromptSuffix: "?",
      deleteResourceWarning: "⚠️ This bookmark will be removed from the database and related tag lists will be updated. This action cannot be undone.",
      deleteResourceSuccess: "Resource deleted successfully.",
      deleteResourceError: "Failed to delete the resource. Please try again.",
      editResourceTitle: "Edit Resource",
      resourceLink: "Link",
      resourceTitle: "Title *",
      resourceDigest: "Summary",
      resourceTags: "Tags",
      resourceTitlePlaceholder: "Enter a resource title",
      resourceDigestPlaceholder: "Enter a resource summary",
      resourceTagPlaceholder: "Enter a tag name",
      addTag: "Add",
      editTitleEmpty: "Title cannot be empty.",
      editSuccess: "Resource updated successfully.",
      editError: "Failed to update the resource. Please try again.",
      savingChanges: "Saving",
      saveChanges: "Save Changes",
    },
  },
};
