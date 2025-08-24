import axios, { isAxiosError } from "axios"

const fetcher = async (url: string) => {
  try {
    const { data } = await axios.get(url, { withCredentials: true })
    return data
  } 
  catch (err) {
    if (isAxiosError(err)) {
      throw new Error(err.response?.data?.message || err.response?.data?.error || err.message)
    }

    if (err instanceof Error)  
      throw new Error(err.message)
      
    throw new Error('An unknown error occurred')
  }
}

export default fetcher
