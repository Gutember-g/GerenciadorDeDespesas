package com.saas.gerenciadordespesas.dto;

public class SummaryDTO {
    private String mesReferencia;
    private Double saldoTotal;
    private Double totalReceitas;
    private Double totalDespesas;
    private RuleSummaryDTO necessidades;
    private RuleSummaryDTO desejos;
    private RuleSummaryDTO reserva;

    // Getters and Setters
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
}
