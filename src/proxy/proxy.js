import { isBlank, isNotBlank, isArray, isString, isObject } from '@beancommons/utils';

// 根据 prefix + baseURL 生成匹配路径
function proxyPath(baseURL, prefix) {
    if (isBlank(baseURL)) {
        return '';
    }
    /**
     * 修剪路径匹配
     * http://localhost:3001 > localhost_3001
     * http://ynreport.bbdservice.net > ynreport.bbdservice.net
     * http://ynreport.bbdservice.net/abc > ynreport.bbdservice.net/abc
     */ 
    var matchingPath = baseURL.replace(/(^http[s]?:\/\/)/, '')
        .replace(/(\/)$/, '')
        .replace(':', '_');

    if (isNotBlank(prefix)) {
        matchingPath = `${prefix}/${matchingPath}`;
    }

    return `/${matchingPath}`;
}
// 为服务设置匹配路径
export function setPathMatching(services, prefix) {
    if (!services) {
        return;
    }

    var options = {};

    // set matching paths
    if (isString(services)) {
        options[proxyPath(services, prefix)] = services;
    } else if (isArray(services)) {
        services.forEach((service) => {
            let key, target;
            if (isString(service)) {
                key = service;
                target = service;
            } else if (isObject(service)) {
                let entry = Object.entries(service)[0];
                key = entry[0];
                target = entry[1];
            }
            options[proxyPath(key, prefix)] = target;
        });
    } else if (isObject(services)) {
        for (let key in services) {
            if (services.hasOwnProperty(key)) {
                options[proxyPath(key, prefix)] = services[key];
            }
        }
    } else {
        throw new Error('proxy options type error, only support string, object or array type');
    }

    return options;
}
// 为匹配路径配置代理选项
function setProxyOptions(options = {}, defaults = {}) {
    var proxyOptions = {};

    for (let key in options) {
        if (options.hasOwnProperty(key)) {
            let opt = options[key];

            proxyOptions[key] = {
                changeOrigin: true,
                cookieDomainRewrite: '',
                cookiePathRewrite: '/',
                pathRewrite: (_path) => _path.replace(key, ''),
                ...defaults
            };

            if (isString(opt)) {
                proxyOptions[key].target = opt;
            } else if (isObject(opt)) {
                Object.assign(proxyOptions[key], opt);
            } else {
                throw new Error('proxy options type error, only support string and object type');
            }
        }
    }

    return proxyOptions;
}

export function proxy(services, prefix = 'proxy', defaults) {
    var options = setPathMatching(services, prefix);
    return setProxyOptions(options, defaults);
}