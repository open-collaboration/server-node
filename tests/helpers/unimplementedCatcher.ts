/**
 * This method wraps obj with a proxy that catches access to any
 * properties not present in obj. This allows easy mocking of
 * any interface, since you can implement the methods you want and
 * an unimplemented method error will be thrown if the code being
 * tested tries to call a method that's has not been mocked.
 */
export default function catchUnimplemented<T>(obj: Partial<T>): T {
    return new Proxy(obj, {
        get(target, field, receiver) {
            if (Reflect.has(target, field)) {
                return Reflect.get(target, field, receiver)
            }

            throw new Error(`${field.toString()} is unimplemented`)
        },
    }) as T
}
