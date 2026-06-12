package com.saas.gerenciadordespesas.dto;

import java.util.List;

public class SummaryDTO {
    private String mesReferencia;
    private Double saldoTotal;
    private Double totalReceitas;
    private Double totalDespesas;
    private RuleSummaryDTO necessidades;
    private RuleSummaryDTO desejos;
    private RuleSummaryDTO reserva;

    // BLOCO 1 & BLOCO 3 & BLOCO 5 novos campos
    private Double faturaPrevistaCartao;
    private Double saldoReservaEmergencia;
    private Double totalCreditoMes;
    private Double totalDebitoPixEspecieMes;
    private Double totalParceladosFatura;
    private String categoriaMaisPesadaCartao;

    // BLOCO 5 Reserva Emergencial
    private Double emergencyMeta;
    private Double emergencyAcumulado;
    private Double emergencyFalta;
    private Double emergencyPercentual;
    private Double emergencyAporteMensal;
    private Double emergencyPrazoEstimado;

    // BLOCO 4 Compras Parceladas
    private List<InstallmentPurchaseDTO> comprasParceladas;

    public SummaryDTO() {
    }

    // Getters and Setters originais
    public String getMesReferencia() { return mesReferencia; }
    public void setMesReferencia(String mesReferencia) { this.mesReferencia = mesReferencia; }
    public Double getSaldoTotal() { return saldoTotal; }
    public void setSaldoTotal(Double saldoTotal) { this.saldoTotal = saldoTotal; }
    public Double getTotalReceitas() { return totalReceitas; }
    public void setTotalReceitas(Double totalReceitas) { this.totalReceitas = totalReceitas; }
    public Double getTotalDespesas() { return totalDespesas; }
    public void setTotalDespesas(Double totalDespesas) { this.totalDespesas = totalDespesas; }
    public RuleSummaryDTO getNecessidades() { return necessidades; }
    public void setNecessidades(RuleSummaryDTO necessidades) { this.necessidades = necessidades; }
    public RuleSummaryDTO getDesejos() { return desejos; }
    public void setDesejos(RuleSummaryDTO desejos) { this.desejos = desejos; }
    public RuleSummaryDTO getReserva() { return reserva; }
    public void setReserva(RuleSummaryDTO reserva) { this.reserva = reserva; }

    // Novos Getters e Setters
    public Double getFaturaPrevistaCartao() { return faturaPrevistaCartao; }
    public void setFaturaPrevistaCartao(Double faturaPrevistaCartao) { this.faturaPrevistaCartao = faturaPrevistaCartao; }
    public Double getSaldoReservaEmergencia() { return saldoReservaEmergencia; }
    public void setSaldoReservaEmergencia(Double saldoReservaEmergencia) { this.saldoReservaEmergencia = saldoReservaEmergencia; }
    public Double getTotalCreditoMes() { return totalCreditoMes; }
    public void setTotalCreditoMes(Double totalCreditoMes) { this.totalCreditoMes = totalCreditoMes; }
    public Double getTotalDebitoPixEspecieMes() { return totalDebitoPixEspecieMes; }
    public void setTotalDebitoPixEspecieMes(Double totalDebitoPixEspecieMes) { this.totalDebitoPixEspecieMes = totalDebitoPixEspecieMes; }
    public Double getTotalParceladosFatura() { return totalParceladosFatura; }
    public void setTotalParceladosFatura(Double totalParceladosFatura) { this.totalParceladosFatura = totalParceladosFatura; }
    public String getCategoriaMaisPesadaCartao() { return categoriaMaisPesadaCartao; }
    public void setCategoriaMaisPesadaCartao(String categoriaMaisPesadaCartao) { this.categoriaMaisPesadaCartao = categoriaMaisPesadaCartao; }

    public Double getEmergencyMeta() { return emergencyMeta; }
    public void setEmergencyMeta(Double emergencyMeta) { this.emergencyMeta = emergencyMeta; }
    public Double getEmergencyAcumulado() { return emergencyAcumulado; }
    public void setEmergencyAcumulado(Double emergencyAcumulado) { this.emergencyAcumulado = emergencyAcumulado; }
    public Double getEmergencyFalta() { return emergencyFalta; }
    public void setEmergencyFalta(Double emergencyFalta) { this.emergencyFalta = emergencyFalta; }
    public Double getEmergencyPercentual() { return emergencyPercentual; }
    public void setEmergencyPercentual(Double emergencyPercentual) { this.emergencyPercentual = emergencyPercentual; }
    public Double getEmergencyAporteMensal() { return emergencyAporteMensal; }
    public void setEmergencyAporteMensal(Double emergencyAporteMensal) { this.emergencyAporteMensal = emergencyAporteMensal; }
    public Double getEmergencyPrazoEstimado() { return emergencyPrazoEstimado; }
    public void setEmergencyPrazoEstimado(Double emergencyPrazoEstimado) { this.emergencyPrazoEstimado = emergencyPrazoEstimado; }

    public List<InstallmentPurchaseDTO> getComprasParceladas() { return comprasParceladas; }
    public void setComprasParceladas(List<InstallmentPurchaseDTO> comprasParceladas) { this.comprasParceladas = comprasParceladas; }
}
