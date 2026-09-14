/**
 * Typings for different kind of markers.
 *
 * @public
 */
export type Marker =
    | { above: string }
    | { below: string }
    | {
          block: {
              begin: string;
              end: string;
          };
      };

/**
 * Typings for a partially managed file. It specifies name and include markers.
 *
 * @public
 */
export interface PartiallyManagedFile {
    filename: string;
    include: Marker;
}
