import axios from "axios"

const baseURL = import.meta.env.BASE_URL

const a = axios.create({
    baseURL
})

export default a