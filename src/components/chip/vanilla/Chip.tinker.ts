import { declareComponent } from '@spicy/tinker/vanilla';
import { chipMeta, type ChipProps } from '../chip.props';
import { Chip } from './Chip';

export default declareComponent<ChipProps>(Chip, chipMeta);
