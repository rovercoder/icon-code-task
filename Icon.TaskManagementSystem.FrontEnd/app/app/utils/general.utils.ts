export function fields<T extends Object>(sampleWithAllPropertiesForKeyEnumeration?: Required<T>): { [P in NonNullable<keyof T>]: P } {
    const keys: (string | symbol)[] | null = 
        (sampleWithAllPropertiesForKeyEnumeration != null && typeof sampleWithAllPropertiesForKeyEnumeration === 'object') 
        ? Object.keys(sampleWithAllPropertiesForKeyEnumeration)
        : null;

    return new Proxy(
        {} as { [P in NonNullable<keyof T>]: P },
        {
            get(_target, prop, _receiver) {
                return prop;
            },
            ...(keys != null && {
                ownKeys(): (string | symbol)[] {
                    return keys;
                },
                getOwnPropertyDescriptor(): PropertyDescriptor {
                    return { enumerable: true, configurable: true };
                }
            }),
        }
    ) as { [P in NonNullable<keyof T>]: P; };
}
