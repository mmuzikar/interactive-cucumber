import { Service, Model } from "./Service";

export class UnknownOpService extends Service {
    canHandle(line: string): boolean {
        return true;
    }    
    
    handle(model: Model, from: number): void {
        this.consumeLine(model, from);
    }


}