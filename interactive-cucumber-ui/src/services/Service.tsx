import { editor } from "monaco-editor";
import { AlertManager } from "react-alert";
import { CucumberContextType } from "../data/CucumberContext";
import { NamingService } from "./NamingService";
import { RunStepService } from "./RunStepService";
import { TagService } from "./TagService";

export interface Service {
    canHandle(model : editor.ITextModel, lineNum : number) : boolean
    execute(model : editor.ITextModel, lineNum : number) : void
}

class ServiceManagerImpl implements Service {
    
    alert: AlertManager
    cucumber: CucumberContextType
    
    constructor(alert: AlertManager, cucumber : CucumberContextType){
        this.alert = alert
        this.cucumber = cucumber

        this.services.push(new RunStepService(this.alert, this.cucumber))
        this.services.push(new NamingService(this.cucumber))
        this.services.push(new TagService(this.cucumber))
    }

    findService(model: editor.ITextModel, lineNum: number) : Service | undefined {
        return this.services.find((svc) => svc.canHandle(model, lineNum))
    }

    canHandle(model: editor.ITextModel, lineNum: number): boolean {
        const svc =  this.findService(model, lineNum)
        console.debug('can handle: ', svc)
        return svc !== undefined
    }
    

    execute(model: editor.ITextModel, lineNum: number): void {
        const svc = this.findService(model, lineNum)
        console.debug('Found service', svc)
        if (svc) {
            svc.execute(model, lineNum)
        } else {
            this.alert.error(`Can't find a service to handle line '${model.getLineContent(lineNum)}'`)
        }
    }

    services : Service[] = []
}

export let ServiceManager : ServiceManagerImpl

export function initServices(alert: AlertManager, cucumber : CucumberContextType) : ServiceManagerImpl {
    ServiceManager = new ServiceManagerImpl(alert, cucumber)
    return ServiceManager
} 