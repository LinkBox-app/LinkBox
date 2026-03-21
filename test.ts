interface Product {
    id: number;
    name: string;
    price: number;
    tags?: string[];
}

function firstItem<T>(arr: T[]): T | undefined {
    return arr[0];
}

interface User {
    id: number;
    name: string;
}

interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

const res: ApiResponse<User[]> = {
    code: 200,
    message: "ok",
    data: [{id: 1, name: "Alice"}]
}

function formatValue(value: string | number) {
    if (typeof value === "string") {
        return value.trim();
    }
    return value.toFixed(2);
}

interface User {
    name: string;
    age: number;
}

function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}