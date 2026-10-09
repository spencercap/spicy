import { declareComponent } from '@spicy/tinker/solid';
import { gradientMeta, type GradientProps } from '../gradient.props';
import { Gradient } from './Gradient';

export default declareComponent<GradientProps>(Gradient, gradientMeta);
