import { TextPosition } from "./image";
import { TableRow } from "./table";

export interface FormProps {
    columns: string[];
    tableData: TableRow[];
    textPositions: TextPosition[];
    imageRef: React.RefObject<HTMLDivElement>;
    image: string | null;
};
