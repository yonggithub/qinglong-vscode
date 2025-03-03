"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const api_1 = __importDefault(require("../api"));
const config_1 = __importDefault(require("../config"));
const express_jwt_1 = __importDefault(require("express-jwt"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("../config/util");
const typedi_1 = __importDefault(require("typedi"));
const open_1 = __importDefault(require("../services/open"));
const express_urlrewrite_1 = __importDefault(require("express-urlrewrite"));
const user_1 = __importDefault(require("../services/user"));
const serve_handler_1 = __importDefault(require("serve-handler"));
const Sentry = __importStar(require("@sentry/node"));
exports.default = ({ app }) => {
    app.enable('trust proxy');
    app.use(cors_1.default());
    app.use((req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/open')) {
            next();
        }
        else {
            return serve_handler_1.default(req, res, {
                public: 'dist',
                rewrites: [{ source: '**', destination: '/index.html' }],
            });
        }
    });
    app.use(body_parser_1.default.json({ limit: '50mb' }));
    app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
    app.use(express_jwt_1.default({
        secret: config_1.default.secret,
        algorithms: ['HS384'],
    }).unless({
        path: [...config_1.default.apiWhiteList, /^\/open\//],
    }));
    app.use((req, res, next) => {
        if (!req.headers) {
            req.platform = 'desktop';
        }
        else {
            const platform = util_1.getPlatform(req.headers['user-agent'] || '');
            req.platform = platform;
        }
        return next();
    });
    app.use(async (req, res, next) => {
        const headerToken = util_1.getToken(req);
        if (req.path.startsWith('/open/')) {
            const openService = typedi_1.default.get(open_1.default);
            const doc = await openService.findTokenByValue(headerToken);
            if (doc && doc.tokens && doc.tokens.length > 0) {
                const currentToken = doc.tokens.find((x) => x.value === headerToken);
                const keyMatch = req.path.match(/\/open\/([a-z]+)\/*/);
                const key = keyMatch && keyMatch[1];
                if (doc.scopes.includes(key) &&
                    currentToken &&
                    currentToken.expiration >= Math.round(Date.now() / 1000)) {
                    return next();
                }
            }
        }
        if (!headerToken &&
            req.path &&
            config_1.default.apiWhiteList.includes(req.path) &&
            req.path !== '/api/crons/status') {
            return next();
        }
        const remoteAddress = req.socket.remoteAddress;
        if (remoteAddress === '::ffff:127.0.0.1' &&
            req.path === '/api/crons/status') {
            return next();
        }
        const data = fs_1.default.readFileSync(config_1.default.authConfigFile, 'utf8');
        if (data) {
            const { token = '', tokens = {} } = JSON.parse(data);
            if (headerToken === token || tokens[req.platform] === headerToken) {
                return next();
            }
        }
        const err = new Error('UnauthorizedError');
        err.status = 401;
        next(err);
    });
    app.use(async (req, res, next) => {
        if (!['/api/user/init', '/api/user/notification/init'].includes(req.path)) {
            return next();
        }
        const userService = typedi_1.default.get(user_1.default);
        const authInfo = await userService.getUserInfo();
        const envDbContent = util_1.getFileContentByName(config_1.default.envDbFile);
        let isInitialized = true;
        if (Object.keys(authInfo).length === 2 &&
            authInfo.username === 'admin' &&
            authInfo.password === 'admin' &&
            envDbContent.length === 0) {
            isInitialized = false;
        }
        if (isInitialized) {
            return res.send({ code: 450, message: '未知错误' });
        }
        else {
            return next();
        }
    });
    app.use(express_urlrewrite_1.default('/open/*', '/api/$1'));
    app.use(config_1.default.api.prefix, api_1.default());
    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });
    app.use(Sentry.Handlers.errorHandler());
    app.use((err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            return res
                .status(err.status)
                .send({ code: 401, message: err.message })
                .end();
        }
        return next(err);
    });
    app.use((err, req, res, next) => {
        Sentry.captureException(err);
        res.status(err.status || 500);
        res.json({
            code: err.status || 500,
            message: err.message,
        });
    });
};
//# sourceMappingURL=express.js.map