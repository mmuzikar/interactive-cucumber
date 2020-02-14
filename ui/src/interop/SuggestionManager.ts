
export type Suggestion = {

}

export class SuggestionManager {

    private static instance: SuggestionManager;

    public static get(){
        if (!this.instance){
            this.instance = new SuggestionManager();
        }
        return this.instance;
    }

    public getSuggestions(suggProvider:string){
        
    }

}

