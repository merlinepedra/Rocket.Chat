import { IUser, Serialized } from "@rocket.chat/core-typings";

export const convertUserFromAPI = (user: Serialized<IUser>): IUser => {
    const {createdAt, lastLogin, _updatedAt, services, ...restUser} = user;
    const { emailCode, email, email2fa, resume, ...restServices } = services || {};

    return {
    createdAt: new Date(createdAt),
    _updatedAt: new Date(_updatedAt),
    ...(lastLogin && { lastLogin: new Date(lastLogin) }),
    ...(services && {
        services: {
            ...restServices,
            emailCode: emailCode ? emailCode.map(({ expire, ...rest }) => ({
                expire: new Date(expire),
                ...rest,
            })) : [],
            ...(email && {
                email: {
                    verificationTokens: email.verificationTokens?.map(({ when, ...rest }) => ({
                        when: new Date(when),
                        ...rest,
                    })),
                },
            }),
            ...(resume && {
                resume: {
                    loginTokens: resume?.loginTokens?.map(({when, createdAt, twoFactorAuthorizedUntil, ...rest}) => ({
                        when: new Date(when),
                        createdAt: new Date(createdAt),
                        ...(twoFactorAuthorizedUntil && { twoFactorAuthorizedUntil: new Date(twoFactorAuthorizedUntil) }),
                        ...rest,
                    }))
                },
            }),
            ...(email2fa && {
                email2fa: {
                    changedAt: new Date(email2fa.changedAt),
                    enabled: email2fa.enabled,
                },
            }),
        },
    }),
    ...restUser,
}};
