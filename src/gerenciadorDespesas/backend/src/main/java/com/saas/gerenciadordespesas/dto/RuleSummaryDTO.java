package com.saas.gerenciadordespesas.dto;

import java.util.List;

public class RuleSummaryDTO {
    private Double valorGasto;
    private Double percentualReal;
    private Double percentualMeta;
    private List<CategorySummaryDTO> categorias;

    public RuleSummaryDTO() {}

    public RuleSummaryDTO(Double valorGasto, Double percentualReal, Double percentualMeta, List<CategorySummaryDTO> categorias) {
        this.valorGasto = valorGasto;
        this.percentualReal = percentualReal;
        this.percentualMeta = percentualMeta;
        this.categorias = categorias;
    }

    // Getters and Setters
    public Double getValorGasto() { return valorGasto; }
    public void setValorGasto(Double valorGasto) { this.valorGasto = valorGasto; }
    public Double getPercentualReal() { return percentualReal; }
    public void setPercentualReal(Double percentualReal) { this.percentualReal = percentualReal; }
    public Double getPercentualMeta() { return percentualMeta; }
    public void setPercentualMeta(Double percentualMeta) { this.percentualMeta = percentualMeta; }
    public List<CategorySummaryDTO> getCategorias() { return categorias; }
    public void setCategorias(List<CategorySummaryDTO> categorias) { this.categorias = categorias; }
}
