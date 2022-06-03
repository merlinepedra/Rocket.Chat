import { IUser, Serialized, IUserServices } from "@rocket.chat/core-typings";

const convertUser = ({createdAt, lastLogin, _updatedAt, services, ...user}: Serialized<IUser>): IUser => {
    return {
        ...user,
        createdAt: new Date(createdAt),
        _updatedAt: new Date(_updatedAt),
        ...(lastLogin && { lastLogin: new Date(lastLogin) }),
        ...(services && {
            services: {
                ...services,
                ...(services?.resume && {
                    resume: {
                        ...services.resume,
                        ...(services.resume?.loginTokens && {
                            loginTokens: services.resume.loginTokens.map(item => ({
                                ...item,
                                ...(item.when && {when: new Date(item.when)}),
                                ...(item.createdAt && {createdAt: new Date(item.createdAt)},
                                ...(item.twoFactorAuthorizedUntil && {twoFactorAuthorizedUntil: new Date(item.twoFactorAuthorizedUntil)}),
                            })),
                        }),
                    },
                }),
                ...(services?.email && {
                    email: {
                        ...services.email,
                        ...(services.email?.verificationTokens && {
                            verificationTokens: services.email.verificationTokens.map((item) => ({
                                ...item,
                                when: new Date(item.when),
                            })),
                        }),
                    },
                }),
                ...(services?.email2fa && {
                    email2fa: {
                        changedAt: new Date(services.email2fa.changedAt),
                    },
                }),
                emailCode: services.emailCode.map(item => ({
                    ...item,
                    expire: new Date(item.expire),
                }))
            }
        }),
    }
};

const ConvertUser = ({createdAt, lastLogin, _updatedAt, services: { emailCode, email, email2fa, resume, ...restServices }, ...restUser}: Serialized<IUser>): IUser => ({
    createdAt: new Date(createdAt),
    _updatedAt: new Date(_updatedAt),
    ...(lastLogin && { lastLogin: new Date(lastLogin) }),
    services: {
        ...restServices
    },
    ...restUser
});





...(emailCode && {
    emailCode: emailCode.map({expire, ...restEmailCode} => ({
        expire: new Date(expire),
        ...restEmailCode,
    }))
}),
