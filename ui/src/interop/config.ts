export class AppConfig {



    static getServerUrl():string {
        return `http://localhost:${this.getServerPort()}`;
    }

    static getServerPort():string {
        return "28319"
    }

}