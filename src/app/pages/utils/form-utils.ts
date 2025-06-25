import { FormGroup, ValidationErrors } from "@angular/forms";


export class FormUtils {

  //Expresiones regulares

  static emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  static passwordPattern = '^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{6,16}$';


  // mensaje de errror
  static getTextErrors (errors : ValidationErrors) {

    for ( const key of Object.keys(errors) ){

      switch( key ){

        case 'required':
          return `Este campo es requerido`;

        case 'email':
          return `El valor ingresado no es un correo electrónico`;

        case 'minLength':
          return `La contraseña debe de tener al menos 6 letras`;

        default:
          return `Error de validación no controlado ${key}`;

      }

    }
    return null;

  }

  static isValidField(form: FormGroup, fieldName: string): boolean | null {
    return (
      !!form.controls[fieldName].errors && form.controls[fieldName].touched
    );
  }

  static getFieldError(form: FormGroup, fieldName: string): string | null {
    if (!form.controls[fieldName]) return null;

    const errors = form.controls[fieldName].errors ?? {};

    return FormUtils.getTextErrors(errors);
  }




}
