import { CucumberService } from "./services/CucumberService";
import { UnknownOpService } from "./services/UnknownOpService";
import { Service, Model, ServiceResult } from "./services/Service";
import { Dispatcher } from "flux";
import { register } from "../editor/FeatureHighlight";

export type Subscription = {
    type: typeof Service, 
    callback:(arg:ServiceResult) => void
}

export class Services {

    services:Service<ServiceResult>[] = []
    noopService:Service<ServiceResult>
    static instance:Services;
    subscriptions:Subscription[] = [];

    constructor(){
        this.registerServices();
        this.noopService = this.registerService(new UnknownOpService());
    }

    private registerService<T extends ServiceResult>(svc:Service<T>) : Service<T>{
        this.services.push(svc);
        return svc;
    }

    static get(){
        if (!this.instance){
            this.instance = new Services();
        }
        return this.instance;
    }

    registerServices(){
        this.registerService(new CucumberService());
    }

    getService(type : typeof Service): Service<any> | undefined {
        return this.services.find(svc => svc instanceof type);
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