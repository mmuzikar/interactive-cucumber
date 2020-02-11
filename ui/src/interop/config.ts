export class AppConfig {



    static getServerUrl():string {
        //TODO:add actual value
        return `http://localhost:${this.getServerPort()}`;
    }

    static getServerPort():string {
        return "28319"
    }

}