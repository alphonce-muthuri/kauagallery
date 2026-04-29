declare module "react-masonry-css" {
  import { ComponentType, ReactNode } from "react";

  export interface MasonryProps {
    breakpointCols?: number | { default: number; [key: number]: number };
    className?: string;
    columnClassName?: string;
    children?: ReactNode;
  }

  const Masonry: ComponentType<MasonryProps>;
  export default Masonry;
}
