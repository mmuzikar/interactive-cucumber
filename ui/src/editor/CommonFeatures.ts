import { register as registerFeatureLang } from "./FeatureHighlight";

export const ID = "feature";


export function registerCommonExtensions(){
    registerFeatureLang();
}