import { useState, useEffect, useCallback } from 'react';
import { Model } from '../types';
import APP_CONFIG from '../config';

// 卉语传心固定使用智谱AI GLM-4.7-Flash模型
const HUIYU_MODELS: Model[] = [
  {
    modelId: 'glm-4-flash',
    name: 'GLM-4.7-Flash',
    description: '智谱AI GLM-4.7-Flash - 卉语传心专用情感模型，支持深度思考',
  }
];

export function useModels() {
  const [models] = useState<Model[]>(HUIYU_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>(APP_CONFIG.defaultModel);

  // 兼容接口，不实际请求
  const fetchModels = useCallback(async () => {
    // 卉语传心固定使用智谱AI，无需动态获取模型列表
  }, []);

  useEffect(() => {
    setSelectedModel(APP_CONFIG.defaultModel);
  }, []);

  return {
    models,
    selectedModel,
    setSelectedModel,
    fetchModels,
  };
}
