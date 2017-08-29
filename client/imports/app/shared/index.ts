import { DisplayNamePipe } from './display-name.pipe';
import { AgePipe } from './age.pipe';
import { KeysPipe, LengthPipe } from './json.pipe';
import { Nl2brPipe } from './nl2br.pipe';

export const SHARED_DECLARATIONS: any[] = [
  DisplayNamePipe,
  AgePipe,
  KeysPipe,
  LengthPipe,
  Nl2brPipe
];
