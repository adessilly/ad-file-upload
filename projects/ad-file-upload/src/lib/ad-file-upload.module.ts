import { NgModule } from '@angular/core';
import { FileSelectDirective } from './file-upload/file-select.directive';
import { FileDropDirective } from './file-upload/file-drop.directive';

/**
 * @deprecated Les directives sont désormais standalone : importez
 * `FileDropDirective` et `FileSelectDirective` directement dans vos
 * composants. Ce module n'est conservé que pour la compatibilité.
 */
@NgModule({
  imports: [ FileDropDirective, FileSelectDirective ],
  exports: [ FileDropDirective, FileSelectDirective ]
})
export class AdFileUploadModule { }
