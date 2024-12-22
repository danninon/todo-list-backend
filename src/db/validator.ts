import { TodoItem } from "../interfaces/TodoItem";

export class DataValidator {
    public validate(todoItem: Omit<TodoItem, "id">): boolean {
        // Validate text: At least one non-whitespace character
        if (!todoItem.text || !todoItem.text.trim()) {
            throw new Error("Invalid text: Text must contain at least one non-whitespace character.");
        }

        // Validate timestamp: Must be in ISO 8601 format
        if (!this.isISOFormat(todoItem.timeStamp)) {
            throw new Error("Invalid timestamp: Must be in ISO 8601 format.");
        }

        return true;
    }
    private isISOFormat(dateTime: string): boolean {
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
        return isoRegex.test(dateTime);
    }

}