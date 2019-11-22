const generateMessage = (username, text) =>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) =>{
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}


const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
module.exports ={
    generateMessage,
    generateLocationMessage,
    capitalize
}