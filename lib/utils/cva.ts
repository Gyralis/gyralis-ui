type VariantDefinitions = Record<
  string,
  Record<string, string>
>

interface CVAOptions {
  variants?: VariantDefinitions
  defaultVariants?: Record<string, string>
}

export function cva(
  base: string,
  options: CVAOptions = {}
) {
  return (props: Record<string, string | undefined> = {}) => {
    const { variants = {}, defaultVariants = {} } = options

    const classes = [base]

    for (const variantName in variants) {
      const variantValue =
        props[variantName] ?? defaultVariants[variantName]
      if (variantValue && variants[variantName][variantValue]) {
        classes.push(variants[variantName][variantValue])
      }
    }

    return classes.join(" ")
  }
}

export type VariantProps<T extends ReturnType<typeof cva>> =
  T extends (props: infer P) => any ? P : never
