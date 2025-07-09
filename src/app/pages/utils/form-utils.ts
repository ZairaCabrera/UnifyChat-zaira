import { FormGroup, ValidationErrors } from "@angular/forms";


export class FormUtils {

  //Expresiones regulares

  static emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  static passwordPattern = '^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{6,16}$';


  // mensaje de error, como un objeto de mapeo
  static textErrors: Record<string,string> = {
    required:  'Este campo es requerido',
    email:     'El valor ingresado no es un correo electrónico',
    minLength: 'La contraseña debe de tener al menos 6 letras',
    default:   'Error de validación no controlado',
  };

  //Devuelve el mensaje correspondiente al primer error encontrado
  //usando el mapeo textError y si no lo encuentra recurre a textErrors.default
  //si la clave no está en el objeto
  static getTextErrors(errors: ValidationErrors): string | null {
    for (const key of Object.keys(errors)) {
      // si no existe usamos el default
      const msg = FormUtils.textErrors[key] ?? FormUtils.textErrors['default'];
      return msg;
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
