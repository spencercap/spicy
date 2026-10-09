import { declareComponent } from '@spicy/tinker/vanilla';
import { gradientMeta, type GradientProps } from '../gradient.props';
import { Gradient } from './Gradient';

export default declareComponent<GradientProps>(Gradient, gradientMeta);
