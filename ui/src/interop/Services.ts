import { CucumberService } from "./services/CucumberService";
import { UnknownOpService } from "./services/UnknownOpService";
import { Service, Model } from "./services/Service";

export class Services {

    services:Service[] = []
    noopService:Service
    static instance:Services;

    constructor(){
        this.registerServices();
        this.noopService = new UnknownOpService();
    }

    static get(){
        if (!this.instance){
            this.instance = new Services();
        }
        return this.instance;
    }

    registerServices(){
        this.services.push(new CucumberService());
    }

    evaluate(model:Model, from:number){
        const service = this.services.find(s => s.canHandleModel(model, from));
        console.debug(service);
        if (service){
            service.handle(model, from);
        } else {
            this.noopService.handle(model, from);
        }
    }



}