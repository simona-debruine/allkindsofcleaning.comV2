interface BrandLogoProps {
  showText?: boolean;
  className?: string;
  textClassName?: string;
  imageClassName?: string;
}

const logoSrc = `${__BASE_PATH__}logo.png`;

export default function BrandLogo({
  showText = true,
  className = "",
  textClassName = "font-heading font-bold text-lg md:text-xl tracking-tight whitespace-nowrap",
  imageClassName = "h-[60px] w-[60px] md:h-[66px] md:w-[66px] object-contain shrink-0",
}: BrandLogoProps) {
  return (
    <span className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <img
        src={logoSrc}
        alt="All Kinds of Cleaning logo"
        className={imageClassName}
      />
      {showText && <span className={textClassName}>All Kinds of Cleaning</span>}
    </span>
  );
}
