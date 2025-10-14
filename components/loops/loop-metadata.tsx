type LoopMetadataProps = {
  title: string
  isSuper?: boolean
  description: string
}

export const LoopMetadata: React.FC<LoopMetadataProps> = ({
  title,
  isSuper,
  description,
}) => {
  const badgeStyles = isSuper
    ? "from-orange-400 to-pink-400"
    : "from-blue-400 to-teal-400"

  return (
    <div className="col-span-1 flex flex-col justify-between rounded-2xl border p-4 lg:pr-6">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h3 className="font-heading text-xl text-foreground md:text-2xl">
            {title}
          </h3>
          <span
            className={`inline-block rounded-full bg-gradient-to-r ${badgeStyles} px-3 py-1.5 text-xs font-semibold text-white shadow-lg`}
          >
            {isSuper ? "SUPER LOOP" : "LOOP"}
          </span>
        </div>
        <p className="mb-6 text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      </div>
    </div>
  )
}
