import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(422).json({
        errors: extractedErrors,
    });
};

export const orderValidationRules = () => {
    return [
        body('customerFirstName').notEmpty().withMessage('Customer first name is required').trim().escape(),
        body('customerLastName').notEmpty().withMessage('Customer last name is required').trim().escape(),
        body('completionDate').isISO8601().toDate().withMessage('Valid completion date is required'),
        body('branch').notEmpty().withMessage('Branch is required').trim().escape(),
        body('vin').optional().trim().escape(),
        body('orderNumber').optional().trim().escape(),
        body('paintNumber').optional().trim().escape(),
        body('additionalOrderInfo').optional().trim().escape(),
        body('items.*.part').optional().trim().escape(),
        body('items.*.code').optional().trim().escape(),
        body('items.*.info').optional().trim().escape(),
        body('items.*.additional_info').optional().trim().escape(),
    ];
};

export const loginValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
        body('password').notEmpty().withMessage('Password cannot be empty'),
    ];
};
