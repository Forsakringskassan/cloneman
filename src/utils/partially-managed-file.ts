/**
 * Typings for different kind of markers.
 *
 * @public
 */
export type Marker =
    | {
          /** Manage content above the specified marker. */
          above: string;
      }
    | {
          /** Manage content below the specified marker. */
          below: string;
      }
    | {
          /** Manage content between begin and end markers. */
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
    /** The file path relative to the template root. */
    filename: string;
    /** Specifies which parts of the file to manage using marker. */
    include: Marker;
}
