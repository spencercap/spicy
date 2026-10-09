import { declareComponent } from '@spicy/tinker/vue';
import { gradientMeta, type GradientProps } from '../gradient.props';
import Gradient from './Gradient.vue';

export default declareComponent<GradientProps>(Gradient, gradientMeta);
