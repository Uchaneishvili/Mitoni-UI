import { message } from 'antd';


export const handleBackendError = (error, form) => {
  const data = error?.response?.data;
  
  if (!data) {
    message.error(error?.message || 'Something went wrong');
    return;
  }

  const { errors, message: backendMessage } = data;

  if (errors && form) {
    let antdErrors = [];
    
    if (Array.isArray(errors)) {
      antdErrors = errors.map(err => ({
        name: err.field || err.path,
        errors: [err.message || err.msg]
      }));
    } else if (typeof errors === 'object') {
      antdErrors = Object.keys(errors).map(key => ({
        name: key,
        errors: Array.isArray(errors[key]) ? errors[key] : [errors[key]]
      }));
    }

    if (antdErrors.length > 0) {
      form.setFields(antdErrors);
      message.error(backendMessage || 'Please check the form for errors');
      return;
    }
  }

  message.error(backendMessage || 'An error occurred on the server.');
};
