
let isHosted: boolean = process.env.NODE_ENV === 'production'


const getUrl = (endpoint:string) => {
    return isHosted ? `/${endpoint}` : `http://localhost:28319/${endpoint}`
}

export const fetchAPI = (endpoint: string) => {
    return fetch(getUrl(endpoint), { mode: "cors" })
}

export const postApi = (endpoint: string, body: any) => {
    return fetch(getUrl(endpoint), {
        mode: "cors",
        body: body,
        method: "POST"
    })
}
