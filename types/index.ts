import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

export type columnsT = (
    | {
          name: string;
          uid: string;
          sortable?: undefined;
      }
    | {
          name: string;
          uid: string;
          sortable: boolean;
      }
)[];

export type IngredientT = {
    id: string;
    name: string;
    userId: string;
    unit: string;
    price: number;
    createdAt: Date;
    supplier: string;
    category: string;
    updatedAt: Date;
};
