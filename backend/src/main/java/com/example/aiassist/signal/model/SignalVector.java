package com.example.aiassist.signal.model;

public class SignalVector {

    public boolean hasRecursion;
    public boolean hasDPArray;
    public boolean hasMemo;
    public boolean usesSort;
    public boolean usesHashMap; // ✅ NEW
    public int loopDepth;

}
