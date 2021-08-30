export function forEachValue(options, cb) {
    return Object.keys(options).forEach(key => cb(options[key], key))
}
