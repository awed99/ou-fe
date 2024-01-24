import store from 'store'
import auth from './auth/en.json'
import general from './general/en.json'
import wizzard from './wizzard/en.json'

const Language = (path) => {
    const lang = store.get('language') ?? 'en'
    if (lang === 'en') {
        if (path === 'auth') {
            return auth
        } else if (path === 'general') {
            return general
        } else if (path === 'wizzard') {
            return wizzard
        }
    }
}

export default Language