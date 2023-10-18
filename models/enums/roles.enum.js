const ROL = {
    ADMIN: 'ADMIN',
    CREATOR: 'CREATOR',
    READER: 'READER'
};

const ROLES = [
    ROL.ADMIN,
    ROL.CREATOR,
    ROL.READER
];


module.exports = {
    ...ROL,
    values: ROLES
};
