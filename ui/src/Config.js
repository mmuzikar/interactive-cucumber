export let port = 28319;
export let url = "localhost";

export function getBaseUrl(){
    return `http://${url}:${port}`
}

