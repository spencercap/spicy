import { declareComponent } from '@spicy/tinker/vue';
import { chipMeta, type ChipProps } from '../chip.props';
import Chip from './Chip.vue';

export default declareComponent<ChipProps>(Chip, chipMeta);
