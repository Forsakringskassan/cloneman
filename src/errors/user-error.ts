/**
 * @internal
 */
export class UserError extends Error {
    public constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "UserError";
    }

    public prettyMessage(): string {
        return this.message;
    }
}
