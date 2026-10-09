import { declareComponent } from '@spicy/tinker/solid';
import { chipMeta, type ChipProps } from '../chip.props';
import { Chip } from './Chip';

export default declareComponent<ChipProps>(Chip, chipMeta);
