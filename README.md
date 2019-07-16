
# AdFileUpload

Fork of https://github.com/valor-software/ng2-file-upload/tree/development/src/file-upload to make it compatible with angular8 + ivy.

## How to edit your code from ng2-file-upload

- *in your modules* :
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
by
import { AdFileUploadModule } from 'ad-file-upload';

- in *components html* : 
   - replace all **ng2FileDrop** by **adFileDrop**
   - replace all **ng2FileSelect** by **adFileSelect**

- in *components ts*: replace all imports : 
```
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
by
import { AdFileUploader } from 'ad-file-upload';
```
```
import {FileItem} from 'ng2-file-upload';
by
import {FileItem} from 'ad-file-upload';
```
