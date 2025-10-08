#!/usr/bin/env python3
"""
Quick test script for ICP Normalization (STEP 1) + LLM Router (STEP 2)

Usage:
    python test_router.py "Your ICP text here"
    
    OR (interactive mode):
    python test_router.py
"""

import asyncio
import sys
import json
from app.services.icp_service import ICPService


def print_separator(char="=", length=100):
    """Print a separator line."""
    print(char * length)


def print_section(title, emoji=""):
    """Print a section header."""
    print(f"\n{emoji} {title}")
    print_separator()


def print_scores(scores):
    """Print routing scores in a nice format."""
    print("\n📊 Routing Scores:")
    print(f"  • Specificity:  {scores.get('specificity', 0):.2f} (how fully ICP specifies filters)")
    print(f"  • Mappability:  {scores.get('mappability', 0):.2f} (maps to firmographic APIs)")
    print(f"  • Stability:    {scores.get('stability', 0):.2f} (temporal/volatile demands)")


def print_route(route, reason):
    """Print the selected route."""
    route_emoji = {
        'structured': '🏗️',
        'hybrid': '🔀',
        'deep_research': '🔬'
    }.get(route, '❓')
    
    print(f"\n{route_emoji} Selected Route: {route.upper()}")
    print(f"   Reason: {reason}")


def print_research_plan(plan):
    """Print research plan details."""
    print("\n📋 Research Plan:")
    
    if plan.get('themes'):
        print(f"  • Themes: {', '.join(plan['themes'][:5])}")
    
    if plan.get('personas'):
        print(f"  • Personas: {', '.join(plan['personas'])}")
    
    if plan.get('seed_strategies'):
        print(f"  • Seed Strategies: {', '.join(plan['seed_strategies'])}")
    
    if plan.get('evidence_requirements'):
        print(f"  • Evidence Requirements: {len(plan['evidence_requirements'])} rules")
        for req in plan['evidence_requirements'][:3]:
            print(f"    - {req}")
        if len(plan['evidence_requirements']) > 3:
            print(f"    ... and {len(plan['evidence_requirements']) - 3} more")
    
    if plan.get('hard_filters'):
        hf = plan['hard_filters']
        print(f"  • Hard Filters:")
        if hf.get('employee_count'):
            print(f"    - Employee Count: {hf['employee_count']}")
        if hf.get('industries'):
            print(f"    - Industries: {', '.join(hf['industries'][:3])}")
        if hf.get('countries'):
            print(f"    - Countries: {', '.join(hf['countries'][:3])}")
    
    if plan.get('time_windows'):
        tw = plan['time_windows']
        print(f"  • Time Windows:")
        print(f"    - Recency: {tw.get('recency_months_default', 12)} months")
        print(f"    - Jobs: {tw.get('jobs_months', 3)} months")
        print(f"    - Tech Adoption: {tw.get('tech_adoption_months', 18)} months")
    
    if plan.get('notes'):
        print(f"  • Notes: {plan['notes']}")


def print_personas(personas):
    """Print persona details."""
    print(f"\n👥 Personas Identified: {len(personas)}")
    for i, persona in enumerate(personas, 1):
        print(f"  {i}. {persona.get('name', 'Unknown')}")
        print(f"     - Seniority: {', '.join(persona.get('seniority', []))}")
        print(f"     - Functions: {', '.join(persona.get('functions', []))}")


def print_company_filters(filters):
    """Print company filter details."""
    print("\n🏢 Company Filters:")
    
    if filters.get('employee_count'):
        emp = filters['employee_count']
        min_emp = emp.get('min', '?')
        max_emp = emp.get('max', '?')
        print(f"  • Employee Count: {min_emp} - {max_emp}")
    
    if filters.get('arr_usd'):
        arr = filters['arr_usd']
        min_arr = f"${arr.get('min', 0):,}" if arr.get('min') else "?"
        max_arr = f"${arr.get('max', 0):,}" if arr.get('max') else "?"
        print(f"  • Revenue (ARR): {min_arr} - {max_arr}")
    
    if filters.get('industries'):
        print(f"  • Industries: {', '.join(filters['industries'][:5])}")
        if len(filters['industries']) > 5:
            print(f"    ... and {len(filters['industries']) - 5} more")
    
    if filters.get('technologies'):
        print(f"  • Technologies: {', '.join(filters['technologies'][:5])}")
        if len(filters['technologies']) > 5:
            print(f"    ... and {len(filters['technologies']) - 5} more")
    
    if filters.get('locations') or filters.get('cities'):
        locs = filters.get('cities') or filters.get('locations') or []
        print(f"  • Locations: {', '.join(locs[:5])}")


async def test_icp_normalization_and_routing(icp_text: str):
    """Test ICP normalization and routing."""
    print_separator("=")
    print("🧪 TESTING ICP NORMALIZATION + LLM ROUTER")
    print_separator("=")
    
    print(f"\n📝 Input ICP:")
    print(f"{icp_text}")
    
    # Initialize service
    print("\n⏳ Initializing ICP Service...")
    service = ICPService()
    
    try:
        # Call the service (STEP 1 + STEP 2)
        print("⏳ Processing ICP (STEP 1: Normalization + STEP 2: Routing)...\n")
        result = await service.normalize_icp(icp_text)
        
        if not result.get('success'):
            print("\n❌ ERROR:")
            print(f"   {result.get('error', 'Unknown error')}")
            return
        
        # ===== STEP 1 RESULTS: ICP NORMALIZATION =====
        print_section("STEP 1 RESULTS: ICP NORMALIZATION", "✅")
        
        icp_config = result.get('icp_config')
        if icp_config:
            # Use model_dump() for Pydantic V2, fallback to dict() for V1
            if hasattr(icp_config, 'model_dump'):
                icp_dict = icp_config.model_dump()
            elif hasattr(icp_config, 'dict'):
                icp_dict = icp_config.dict()
            else:
                icp_dict = icp_config
            
            # Print personas
            if icp_dict.get('personas'):
                print_personas(icp_dict['personas'])
            
            # Print company filters
            if icp_dict.get('company_filters'):
                print_company_filters(icp_dict['company_filters'])
            
            # Print contact targets
            if icp_dict.get('contact_persona_targets'):
                targets = icp_dict['contact_persona_targets']
                print(f"\n🎯 Contact Targets:")
                print(f"  • Per Company: {targets.get('per_company_min', '?')} - {targets.get('per_company_max', '?')} contacts")
                print(f"  • Persona Order: {', '.join(targets.get('persona_order', []))}")
        
        # ===== STEP 2 RESULTS: LLM ROUTING =====
        print_section("STEP 2 RESULTS: LLM ROUTING DECISION", "✅")
        
        routing_decision = result.get('routing_decision')
        if routing_decision:
            # Use model_dump() for Pydantic V2, fallback to dict() for V1
            if hasattr(routing_decision, 'model_dump'):
                routing_dict = routing_decision.model_dump()
            elif hasattr(routing_decision, 'dict'):
                routing_dict = routing_decision.dict()
            else:
                routing_dict = routing_decision
            
            # Print scores
            if routing_dict.get('scores'):
                print_scores(routing_dict['scores'])
            
            # Print route
            if routing_dict.get('route'):
                print_route(routing_dict['route'], routing_dict.get('route_reason', 'No reason provided'))
            
            # Print research plan
            if routing_dict.get('research_plan'):
                print_research_plan(routing_dict['research_plan'])
        else:
            print("\n⚠️  Routing decision not available (may have failed gracefully)")
            if result.get('error'):
                print(f"   Warning: {result.get('error')}")
        
        # ===== SUMMARY =====
        print_section("SUMMARY", "📊")
        print(f"  • Session ID: {result.get('session_id', 'N/A')}")
        print(f"  • Success: {result.get('success', False)}")
        
        if routing_decision:
            # Use model_dump() for Pydantic V2, fallback to dict() for V1
            if hasattr(routing_decision, 'model_dump'):
                routing_dict = routing_decision.model_dump()
            elif hasattr(routing_decision, 'dict'):
                routing_dict = routing_decision.dict()
            else:
                routing_dict = routing_decision
            route = routing_dict.get('route', 'unknown')
            print(f"  • Recommended Route: {route.upper()}")
        
        print_separator("=")
        print("✅ Test completed successfully!")
        print_separator("=")
        
        # Optionally save full JSON
        print("\n💾 Full JSON Response:")
        print_separator("-")
        
        # Convert result to JSON-serializable format
        # Helper function to convert Pydantic models
        def to_dict(obj):
            if obj is None:
                return None
            if hasattr(obj, 'model_dump'):
                return obj.model_dump()
            elif hasattr(obj, 'dict'):
                return obj.dict()
            else:
                return obj
        
        json_result = {
            "success": result.get('success'),
            "session_id": result.get('session_id'),
            "icp_config": to_dict(icp_config),
            "routing_decision": to_dict(routing_decision),
            "error": result.get('error')
        }
        
        print(json.dumps(json_result, indent=2))
        print_separator("-")
        
    except Exception as e:
        print(f"\n❌ ERROR during test:")
        print(f"   {type(e).__name__}: {str(e)}")
        import traceback
        print("\n🔍 Traceback:")
        traceback.print_exc()


def main():
    """Main entry point."""
    # Get ICP text from command line or prompt user
    if len(sys.argv) > 1:
        # ICP text provided as command line argument
        icp_text = " ".join(sys.argv[1:])
    else:
        # Interactive mode
        print("="*100)
        print("🧪 ICP NORMALIZATION + ROUTER TEST TOOL")
        print("="*100)
        print("\nEnter your ICP description (press Enter twice when done):")
        print("-"*100)
        
        lines = []
        empty_count = 0
        while True:
            try:
                line = input()
                if not line:
                    empty_count += 1
                    if empty_count >= 1:  # End on first empty line
                        break
                else:
                    empty_count = 0
                    lines.append(line)
            except EOFError:
                break
        
        icp_text = "\n".join(lines).strip()
        
        if not icp_text:
            print("\n❌ No ICP text provided. Exiting.")
            return
    
    # Run the async test
    asyncio.run(test_icp_normalization_and_routing(icp_text))


if __name__ == "__main__":
    main()
