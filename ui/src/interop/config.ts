
//Config class, edit this if the backend is runing on a different port
export class AppConfig {

    static getServerUrl():string {
        return `http://localhost:${this.getServerPort()}`;
    }

    static getServerPort():string {
        return "28319"
    }

}