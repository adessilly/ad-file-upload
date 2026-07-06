# ad-file-upload

Directives Angular pour l'upload de fichiers : sélection via `<input type="file">`
et glisser-déposer, avec gestion de file d'attente, filtres (taille, type MIME),
progression et hooks sur chaque étape du cycle d'upload.

Compatible **Angular >= 22**, directives **standalone**, inputs/outputs en
**signaux**, fonctionne dans les applications **zoneless**.

## Installation

```bash
npm install ad-file-upload
```

Peer dependencies : `@angular/core >= 22.0.0`, `rxjs >= 7.8.0`.

## Utilisation

Importez les directives directement dans votre composant standalone :

```ts
import { Component, signal } from '@angular/core';
import { FileDropDirective, FileItem, FileSelectDirective, FileUploader } from 'ad-file-upload';

@Component({
  selector: 'app-upload',
  imports: [FileDropDirective, FileSelectDirective],
  template: `
    <div
      adFileDrop
      [uploader]="uploader"
      [class.over]="fileOver()"
      (fileOver)="fileOver.set($event)"
      (onFileDrop)="refreshQueue()"
    >
      @if (fileOver()) {
        <p>Relâchez pour ajouter les fichiers</p>
      } @else {
        <p>Glissez-déposez vos fichiers ici</p>
      }
    </div>

    <input type="file" multiple adFileSelect [uploader]="uploader" (onFileSelected)="refreshQueue()" />

    <ul>
      @for (item of queue(); track item.file.name) {
        <li>{{ item.file.name }} — {{ item.progress }}%</li>
      } @empty {
        <li>Aucun fichier dans la file</li>
      }
    </ul>

    <button (click)="uploader.uploadAll()">Tout envoyer</button>
  `
})
export class UploadComponent {
  protected readonly fileOver = signal(false);
  protected readonly queue = signal<FileItem[]>([]);

  protected readonly uploader = new FileUploader({
    url: '/api/upload',
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeType: ['image/png', 'image/jpeg', 'application/pdf']
  });

  public constructor() {
    // Les callbacks du FileUploader s'exécutent hors du graphe réactif d'Angular :
    // resynchroniser un signal ici déclenche le rendu, y compris en zoneless.
    this.uploader.onAfterAddingAll = () => this.refreshQueue();
    this.uploader.onProgressItem = () => this.refreshQueue();
    this.uploader.onCompleteItem = () => this.refreshQueue();
  }

  protected refreshQueue(): void {
    this.queue.set([...this.uploader.queue]);
  }
}
```

## API

### Directives

| Directive | Sélecteur | Inputs | Outputs |
| --- | --- | --- | --- |
| `FileSelectDirective` | `[adFileSelect]` | `uploader` (requis) | `onFileSelected: File[]` |
| `FileDropDirective` | `[adFileDrop]` | `uploader` (requis) | `fileOver: boolean`, `onFileDrop: File[]` |

`AdFileUploadModule` existe encore pour la compatibilité NgModule mais est
**déprécié** : importez les directives directement.

### FileUploader

```ts
const uploader = new FileUploader(options);
```

Principales options (`FileUploaderOptions`) :

| Option | Type | Description |
| --- | --- | --- |
| `url` | `string` | URL d'upload (défaut `'/'`). |
| `method` | `string` | Méthode HTTP (défaut `POST`). |
| `autoUpload` | `boolean` | Envoie chaque fichier dès son ajout à la file. |
| `maxFileSize` | `number` | Taille max en octets. |
| `allowedMimeType` | `string[]` | Types MIME acceptés. |
| `allowedFileType` | `string[]` | Familles de fichiers acceptées (`image`, `pdf`, `doc`…). |
| `queueLimit` | `number` | Nombre max de fichiers dans la file. |
| `headers` | `{ name, value }[]` | En-têtes HTTP ajoutés à chaque requête. |
| `authToken` / `authTokenHeader` | `string` | Jeton d'authentification (en-tête `Authorization` par défaut). |
| `removeAfterUpload` | `boolean` | Retire l'item de la file après envoi. |
| `additionalParameter` | `object` | Champs supplémentaires du `FormData` (supporte `{{file_name}}`). |
| `parametersBeforeFiles` | `boolean` | Place les paramètres avant le fichier (requis par AWS S3). |
| `disableMultipart` | `boolean` | Envoie le fichier brut au lieu d'un `FormData` (voir `formatDataFunction`). |
| `filters` | `FilterFunction[]` | Filtres personnalisés appliqués à l'ajout. |

Méthodes utiles : `uploadAll()`, `uploadItem(item)`, `cancelAll()`,
`cancelItem(item)`, `clearQueue()`, `removeFromQueue(item)`, `setOptions(options)`.

Hooks réassignables pour réagir au cycle d'upload : `onAfterAddingFile`,
`onAfterAddingAll`, `onWhenAddingFileFailed`, `onBeforeUploadItem`,
`onBuildItemForm`, `onProgressItem`, `onProgressAll`, `onSuccessItem`,
`onErrorItem`, `onCancelItem`, `onCompleteItem`, `onCompleteAll`.

`uploader.response` est un `Subject<string>` qui émet le corps de chaque
réponse HTTP : `uploader.response.subscribe(body => ...)`.

Chaque élément de `uploader.queue` est un `FileItem` : `file` (métadonnées),
`progress`, `isUploading`, `isSuccess`, `isError`, `isCancel`, et les méthodes
`upload()`, `cancel()`, `remove()`.

## Développement

Ce dépôt contient la librairie (`projects/ad-file-upload`) et une application
de démonstration (`src/`).

```bash
npm run build:lib   # construit la librairie dans dist/ad-file-upload
npm start           # sert l'app de démo (nécessite build:lib au préalable)
npm run deploy:lib  # build + publication sur npm
```

## Notes de version

### 2.0.0 (2026-07-06) — Migration Angular 22

Migration complète vers Angular 22 : directives standalone, inputs/outputs
en signaux et compatibilité zoneless. L'usage **en template ne change pas**
(`[uploader]`, `(fileOver)`, `(onFileDrop)`, `(onFileSelected)`), mais
plusieurs changements peuvent casser du code existant.

#### ⚠️ Breaking changes

- **Angular >= 22 requis.** Les peer dependencies passent à
  `@angular/core >= 22.0.0` et `rxjs >= 7.8.0`. La lib est compilée en mode
  partial Ivy avec Angular 22 et ne s'installera plus sur les versions
  antérieures.

- **`FileUploader.response` est un `Subject<string>`** (rxjs) et non plus un
  `EventEmitter<any>`.
  - `uploader.response.subscribe(...)` fonctionne à l'identique.
  - `uploader.response.emit(...)` n'existe plus → utiliser `.next(...)`.

- **Les inputs des directives sont des signaux.** Si vous accédez à une
  directive par code (`@ViewChild`, injection, tests), `directive.uploader`
  n'est plus une propriété mais un signal : lisez-le avec
  `directive.uploader()`. Il n'est plus assignable par code — passez toujours
  par le binding `[uploader]`.

- **Les outputs sont des `OutputEmitterRef`** et non plus des `EventEmitter`.
  En template rien ne change ; par code, `.subscribe(fn)` existe toujours mais
  ne retourne plus une `Subscription` rxjs (pas de `.pipe()`). Pour un
  observable, utilisez `outputToObservable()` de `@angular/core/rxjs-interop`.

- **Typage strict (TypeScript 6).** Quelques signatures publiques ont changé
  dans les `.d.ts` :
  - `FileItem.index` devient `number | undefined`, `FileItem._xhr` devient
    optionnel (`XMLHttpRequest | undefined`).
  - `FileUploader.authToken` devient `string | undefined`.
  - Les filtres internes (`_mimeTypeFilter`, `_fileSizeFilter`,
    `_fileTypeFilter`) acceptent un item optionnel, conformément au type
    `FilterFunction`.
  - `FileItem.url` et l'URL des items retombent sur `'/'` quand aucune `url`
    n'est fournie dans les options (avant : `undefined` à l'exécution).

- **`onFileSelected` émet un vrai `File[]`.** La directive convertit désormais
  la `FileList` native (`Array.from`) ; le type déclaré était déjà `File[]`,
  mais le code qui dépendait des spécificités de `FileList` (ex. `.item(i)`)
  doit être adapté.

#### Déprécié (toujours fonctionnel)

- **`AdFileUploadModule`** : les directives `FileDropDirective` et
  `FileSelectDirective` sont standalone — importez-les directement dans vos
  composants. Le module est conservé uniquement pour la compatibilité et sera
  supprimé dans une version future.

  ```ts
  // Avant
  @NgModule({ imports: [AdFileUploadModule] })

  // Après
  @Component({
    imports: [FileDropDirective, FileSelectDirective],
    ...
  })
  ```

#### Divers

- Compatible avec les applications **zoneless**
  (`provideZonelessChangeDetection()`) : les callbacks du `FileUploader`
  (`onProgressItem`, `onCompleteItem`, …) sont invoqués hors du graphe réactif
  d'Angular ; resynchronisez un signal dans ces callbacks pour déclencher le
  rendu (voir l'app de démo dans `src/app`).

### 1.x

Dernières versions compatibles Angular 16 (NgModule, `@Input`/`@Output`
classiques).
